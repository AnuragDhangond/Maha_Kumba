package com.kumbh.service;

import com.kumbh.entity.HealthTip;
import com.kumbh.repository.HealthTipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HealthTipService {

    @Autowired
    private HealthTipRepository repository;

    public List<HealthTip> getAllTips() {
        return repository.findAll();
    }

    public List<HealthTip> getTipsByCategory(String category) {
        return repository.findByCategory(category);
    }
    
    public Optional<HealthTip> getTipByCategory(String category) {
        return repository.findByCategory(category).stream().findFirst();
    }

    public HealthTip createTip(HealthTip tip) {
        return repository.save(tip);
    }

    public Optional<HealthTip> updateTip(Long id, HealthTip tipDetails) {
        return repository.findById(id).map(tip -> {
            tip.setCategory(tipDetails.getCategory());
            tip.setTipText(tipDetails.getTipText());
            tip.setImagePath(tipDetails.getImagePath());
            return repository.save(tip);
        });
    }

    public boolean deleteTip(Long id) {
        return repository.findById(id).map(tip -> {
            repository.delete(tip);
            return true;
        }).orElse(false);
    }
}
