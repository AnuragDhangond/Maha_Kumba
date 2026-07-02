package com.kumbh.service;

import com.kumbh.entity.PoojaBooking;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Async
    public void sendBookingReceived(PoojaBooking booking) {
        try {
            System.out.println(">>>>>>>>>> WHATSAPP NOTIFICATION START >>>>>>>>>>");
            System.out.println("NOTIFICATION: Booking request received for " + booking.getDevoteeName() + " (Mobile: " + booking.getMobileNumber() + ")");
            // Mocking WhatsApp API call
            Thread.sleep(1000); 
            System.out.println("NOTIFICATION: WhatsApp notification sent successfully!");
            System.out.println("<<<<<<<<<< WHATSAPP NOTIFICATION END <<<<<<<<<<");
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp notification: " + e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmed(PoojaBooking booking) {
        try {
            System.out.println("Sending WhatsApp notification: Guruji booking confirmed for " + booking.getDevoteeName() + " (Mobile: " + booking.getMobileNumber() + ")");
            // Mocking WhatsApp API call
            Thread.sleep(1000);
            System.out.println("WhatsApp confirmation notification sent successfully!");
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp confirmation: " + e.getMessage());
        }
    }
}
