import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let isConnectedGlobal = false;
let subscribers = [];
let connectionPromise = null;

const getWebSocketBaseUrl = () => {
    return import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080`;
};

const parseMessageBody = (body) => {
    try {
        return JSON.parse(body);
    } catch (e) {
        return body;
    }
};

const connect = () => {
    if (stompClient && isConnectedGlobal) {
        return Promise.resolve(stompClient);
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        try {
            const client = new Client({
                webSocketFactory: () => new SockJS(`${getWebSocketBaseUrl()}/ws-crowd`),
                debug: () => {},
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                stompClient = client;
                isConnectedGlobal = true;
                connectionPromise = null;

                // Re-subscribe all active subscribers
                subscribers.forEach(({ topic, callback, subscriptionRef }) => {
                    try {
                        const sub = client.subscribe(topic, (message) => {
                            callback(parseMessageBody(message.body));
                        });
                        subscriptionRef.current = sub;
                    } catch (err) {
                        console.error(`Re-subscription failed for ${topic}:`, err);
                    }
                });

                resolve(client);
            };

            client.onStompError = (frame) => {
                console.error('STOMP error:', frame);
                isConnectedGlobal = false;
                stompClient = null;
                connectionPromise = null;
                reject(new Error('STOMP error: ' + frame.body));
            };

            client.onWebSocketClose = () => {
                isConnectedGlobal = false;
                stompClient = null;
                connectionPromise = null;
            };

            client.activate();
        } catch (err) {
            connectionPromise = null;
            stompClient = null;
            reject(err);
        }
    });

    return connectionPromise;
};

export const useWebSocket = (topic, onMessageReceived) => {
    const [isConnected, setIsConnected] = useState(false);
    const callbackRef = useRef(onMessageReceived);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        if (!topic) return undefined;

        let isMounted = true;
        let subscriber = null;

        const setup = async () => {
            try {
                const client = await connect();
                if (!isMounted) return;

                setIsConnected(true);

                if (stompClient && isConnectedGlobal) {
                    try {
                        subscriptionRef.current = stompClient.subscribe(topic, (message) => {
                            if (isMounted && callbackRef.current) {
                                callbackRef.current(parseMessageBody(message.body));
                            }
                        });
                    } catch (subErr) {
                        console.error(`Subscription failed in setup for ${topic}:`, subErr);
                    }
                }

                subscriber = {
                    topic,
                    callback: (data) => {
                        if (isMounted) {
                            callbackRef.current?.(data);
                        }
                    },
                    subscriptionRef,
                };
                subscribers.push(subscriber);
            } catch (err) {
                console.error(`WebSocket setup failed for ${topic}:`, err);
            }
        };

        setup();

        return () => {
            isMounted = false;
            if (subscriptionRef.current) {
                try {
                    subscriptionRef.current.unsubscribe();
                } catch (unsubErr) {
                    // Ignore errors on unsubscribe during teardown
                }
            }
            if (subscriber) {
                subscribers = subscribers.filter((item) => item !== subscriber);
            }
        };
    }, [topic]);

    return { isConnected: isConnected && isConnectedGlobal };
};
