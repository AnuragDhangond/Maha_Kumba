package com.kumbh.service.impl;

import com.kumbh.dto.HelplineDto;
import com.kumbh.entity.Helpline;
import com.kumbh.pagination.HelplinePagination;
import com.kumbh.repository.HelplineRepository;
import com.kumbh.service.HelplineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HelplineServiceImpl implements HelplineService {

    @Autowired
    private HelplineRepository repository;

    @Autowired
    private HelplinePagination pagination;

    @Override
    public Helpline createHelpline(Helpline helpline) {
        return repository.save(helpline);
    }

    @Override
    public Page<HelplineDto> getAllHelplines(String search, Integer page, Integer size, String sortBy, String direction, boolean includeInactive) {
        return pagination.getPaginatedHelplines(search, page, size, sortBy, direction, includeInactive);
    }

    @Override
    public List<Helpline> getAllHelplinesList() {
        return repository.findAll().stream().filter(h -> "ACTIVE".equals(h.getStatus())).toList();
    }

    @Override
    public Helpline getHelplineById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Helpline not found with id: " + id));
    }

    @Override
    public Helpline updateHelpline(Long id, Helpline helplineDetails) {
        Helpline helpline = getHelplineById(id);
        helpline.setName(helplineDetails.getName());
        helpline.setNumber(helplineDetails.getNumber());
        helpline.setStatus(helplineDetails.getStatus()); // Allow updating status
        return repository.save(helpline);
    }

    @Override
    public void deleteHelpline(Long id) {
        repository.deactivateHelpline(id);
    }

    @Override
    public boolean existsByName(String name) {
        return repository.existsByNameAndStatus(name, "ACTIVE");
    }

    @Override
    public boolean existsByNumber(String number) {
        return repository.existsByNumberAndStatus(number, "ACTIVE");
    }
}
