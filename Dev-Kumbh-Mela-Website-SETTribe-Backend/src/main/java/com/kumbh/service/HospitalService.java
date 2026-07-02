package com.kumbh.service;

import com.kumbh.dto.HospitalDto;
import com.kumbh.entity.Hospital;
import com.kumbh.pagination.HospitalPagination;
import com.kumbh.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HospitalService {

    @Autowired
    private HospitalRepository repository;

    @Autowired
    private HospitalPagination pagination;

    public List<Hospital> getAllHospitalsList() {
        return repository.findAll();
    }

    public Page<HospitalDto> getAllHospitals(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedHospitals(search, page, size, sortBy, direction);
    }

    public Optional<Hospital> getHospitalById(Long id) {
        return repository.findById(id);
    }

    public Hospital createHospital(Hospital hospital) {
        return repository.save(hospital);
    }

    public Optional<Hospital> updateHospital(Long id, Hospital hospitalDetails) {
        return repository.findById(id).map(hospital -> {
            hospital.setName(hospitalDetails.getName());
            hospital.setAddress(hospitalDetails.getAddress());
            hospital.setLatitude(hospitalDetails.getLatitude());
            hospital.setLongitude(hospitalDetails.getLongitude());
            hospital.setContact(hospitalDetails.getContact());
            hospital.setBeds(hospitalDetails.getBeds());
            hospital.setStatus(hospitalDetails.getStatus());
            return repository.save(hospital);
        });
    }

    public boolean deleteHospital(Long id) {
        return repository.findById(id).map(hospital -> {
            hospital.setStatus("INACTIVE");
            repository.save(hospital);
            return true;
        }).orElse(false);
    }

    public boolean existsByName(String name) {
        return repository.existsByName(name);
    }

    public boolean existsByContact(String contact) {
        return repository.existsByContact(contact);
    }

    public boolean existsByLatitude(Double latitude) {
        return repository.existsByLatitude(latitude);
    }

    public boolean existsByLongitude(Double longitude) {
        return repository.existsByLongitude(longitude);
    }
}
