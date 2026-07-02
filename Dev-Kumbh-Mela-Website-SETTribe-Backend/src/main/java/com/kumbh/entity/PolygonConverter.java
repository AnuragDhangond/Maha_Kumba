package com.kumbh.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;

@Converter(autoApply = true)
public class PolygonConverter implements AttributeConverter<Polygon, String> {

    // Note: WKTReader/Writer are not thread-safe in early versions, 
    // but in modern JTS versions they are lightweight or we can instantiate them as needed.
    // Creating fresh instances is safe and avoids any concurrency issues.
    
    @Override
    public String convertToDatabaseColumn(Polygon attribute) {
        if (attribute == null) {
            return null;
        }
        return new WKTWriter().write(attribute);
    }

    @Override
    public Polygon convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return (Polygon) new WKTReader().read(dbData);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to convert WKT to JTS Polygon: " + dbData, e);
        }
    }
}
