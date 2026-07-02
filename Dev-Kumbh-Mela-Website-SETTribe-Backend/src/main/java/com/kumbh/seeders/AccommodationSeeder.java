package com.kumbh.seeders;

import com.kumbh.entity.*;
import com.kumbh.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import java.util.Arrays;

@Component
@Order(5)
public class AccommodationSeeder {

    @Autowired
    private StayRepository stayRepository;

    public void seed() {
        if (stayRepository.count() == 0) {
            stayRepository.save(new Stay(null, "Enrise by Sayaji Nashik", StayCategory.PREMIUM_HOTELS, 4.8,
                    "/src/assets/hotel_room_premium.png", 1250L,
                    Arrays.asList("Luxury Rooms", "Swimming Pool", "Near Highway", "Free Wifi"),
                    "https://www.booking.com/hotel/in/auspicia.html?aid=2311236&label=en-in-booking-desktop-SoQWfYhAMBURf0HSQntj1AS652796016141%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-334108349%3Alp9062086%3Ali%3Adec%3Adm&sid=e5c615e88bdd9e7c57080502e1cdbc5a&all_sr_blocks=614824402_427729561_2_42_0&checkin=2026-06-02&checkout=2026-06-03&dest_id=-2105851&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=1&highlighted_blocks=614824402_427729561_2_42_0&hpos=1&matching_block_id=614824402_427729561_2_42_0&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=614824402_427729561_2_42_0__330000&srepoch=1779167967&srpvid=2bf1256662f80247&type=total&ucfs=1&"));
            stayRepository.save(new Stay(null, "The SSK Solitaire Boutique Hotel", StayCategory.TRADITIONAL_ASHRAMS,
                    4.6, "/src/assets/hotel_room_ashram.png", 2200L,
                    Arrays.asList("Sattvic Food", "Prayer Hall", "Tranquil", "Affordable"),
                    "booking.com/hotel/in/the-ssk-solitaire-boutique.html?label=en-in-booking-desktop-SoQWfYhAMBURf0HSQntj1AS652796016141%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-334108349%3Alp9062086%3Ali%3Adec%3Adm&gclid=CjwKCAjw8arQBhB9EiwAfIKdQoQXfhb-i2Gasbyt_PyXvA7ABI8OqiT1WOVwGnBuJ3uIdaqwYCfXFxoC8vMQAvD_BwE&aid=2311236&ucfs=1&arphpl=1&checkin=2026-06-02&checkout=2026-06-03&dest_id=-2105851&dest_type=city&group_adults=2&req_adults=2&no_rooms=1&group_children=0&req_children=0&hpos=3&hapos=3&sr_order=popularity&srpvid=2bf1256662f80247&srepoch=1779168052&all_sr_blocks=1348907501_429124564_2_2_0&highlighted_blocks=1348907501_429124564_2_2_0&matching_block_id=1348907501_429124564_2_2_0&sr_pri_blocks=1348907501_429124564_2_2_0__421119&from=searchresults"));
            stayRepository.save(new Stay(null, "Assembly By The Democracy", StayCategory.LUXURY_TENTS, 4.7,
                    "/src/assets/hotel_room_tent.png", 1500L,
                    Arrays.asList("AC Tents", "Ensuite Bathroom", "Ghat Proximity", "Guided Tours"),
                    "https://www.booking.com/hotel/in/assembly-by-the-democracy.html?aid=2311236&label=en-in-booking-desktop-SoQWfYhAMBURf0HSQntj1AS652796016141%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-334108349%3Alp9062086%3Ali%3Adec%3Adm&sid=e5c615e88bdd9e7c57080502e1cdbc5a&all_sr_blocks=1530942501_424620094_4_0_0&checkin=2026-06-02&checkout=2026-06-03&dest_id=-2105851&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=5&highlighted_blocks=1530942501_424620094_4_0_0&hpos=5&matching_block_id=1530942501_424620094_4_0_0&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1530942501_424620094_4_0_0__475000&srepoch=1779168146&srpvid=2bf1256662f80247&type=total&ucfs=1&"));
            stayRepository.save(new Stay(null, "Hotel Grand Rio", StayCategory.HERITAGE_HOMESTAYS, 4.5,
                    "/src/assets/hotel_room_heritage.png", 1500L,
                    Arrays.asList("Local Cuisine", "Historic Area", "Host Family", "Garden View"),
                    "https://www.booking.com/hotel/in/grand-rio.html?aid=2311236&label=en-in-booking-desktop-SoQWfYhAMBURf0HSQntj1AS652796016141%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-334108349%3Alp9062086%3Ali%3Adec%3Adm&sid=e5c615e88bdd9e7c57080502e1cdbc5a&all_sr_blocks=253259502_430495925_2_2_0&checkin=2026-06-02&checkout=2026-06-03&dest_id=-2105851&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=6&highlighted_blocks=253259502_430495925_2_2_0&hpos=6&matching_block_id=253259502_430495925_2_2_0&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=253259502_430495925_2_2_0__351000&srepoch=1779168331&srpvid=2bf1256662f80247&type=total&ucfs=1&"));
            stayRepository.save(new Stay(null, "IRA by Orchid Nashik", StayCategory.TRADITIONAL_ASHRAMS, 4.2,
                    "/src/assets/travel_stay_real.png", 120000L,
                    Arrays.asList("Budget Friendly", "Near Station", "Clean Rooms", "24x7 Security"),
                    "https://www.booking.com/hotel/in/vits-nashik.html?aid=2311236&label=en-in-booking-desktop-SoQWfYhAMBURf0HSQntj1AS652796016141%3Apl%3Ata%3Ap1%3Ap2%3Aac%3Aap%3Aneg%3Afi%3Atikwd-334108349%3Alp9062086%3Ali%3Adec%3Adm&sid=e5c615e88bdd9e7c57080502e1cdbc5a&all_sr_blocks=208511802_400580420_2_2_0&checkin=2026-06-02&checkout=2026-06-03&dest_id=-2105851&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=7&highlighted_blocks=208511802_400580420_2_2_0&hpos=7&matching_block_id=208511802_400580420_2_2_0&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=208511802_400580420_2_2_0__334200&srepoch=1779168396&srpvid=2bf1256662f80247&type=total&ucfs=1&"));
            System.out.println("Accommodation data seeded successfully!");
        }
    }
}
