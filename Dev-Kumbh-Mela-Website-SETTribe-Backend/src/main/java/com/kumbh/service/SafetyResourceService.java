package com.kumbh.service;

import com.kumbh.dto.SafetyResourceDto;
import com.kumbh.entity.SafetyResource;
import com.kumbh.pagination.SafetyResourcePagination;
import com.kumbh.repository.SafetyResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SafetyResourceService {

    @Autowired
    private SafetyResourceRepository repository;

    @Autowired
    private SafetyResourcePagination pagination;

    public Page<SafetyResourceDto> getAllResources(String search, Integer page, Integer size, String sortBy, String direction) {
        return pagination.getPaginatedResources(search, page, size, sortBy, direction);
    }

    public Optional<SafetyResource> getResourceById(Long id) {
        return repository.findById(id);
    }

    public SafetyResource createResource(SafetyResource resource) {
        return repository.save(resource);
    }

    public Optional<SafetyResource> updateResource(Long id, SafetyResource resourceDetails) {
        return repository.findById(id).map(resource -> {
            resource.setName(resourceDetails.getName());
            resource.setType(resourceDetails.getType());
            resource.setAddress(resourceDetails.getAddress());
            resource.setContact(resourceDetails.getContact());
            resource.setLatitude(resourceDetails.getLatitude());
            resource.setLongitude(resourceDetails.getLongitude());
            resource.setStatus(resourceDetails.getStatus());
            return repository.save(resource);
        });
    }

    public boolean deleteResource(Long id) {
        return repository.findById(id).map(resource -> {
            repository.delete(resource);
            return true;
        }).orElse(false);
    }
}
