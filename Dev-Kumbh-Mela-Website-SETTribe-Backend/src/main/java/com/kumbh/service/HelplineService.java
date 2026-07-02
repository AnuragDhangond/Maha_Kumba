package com.kumbh.service;

import com.kumbh.dto.HelplineDto;
import com.kumbh.entity.Helpline;
import org.springframework.data.domain.Page;
import java.util.List;

public interface HelplineService {
    Helpline createHelpline(Helpline helpline);
    Page<HelplineDto> getAllHelplines(String search, Integer page, Integer size, String sortBy, String direction, boolean includeInactive);
    List<Helpline> getAllHelplinesList();
    Helpline getHelplineById(Long id);
    Helpline updateHelpline(Long id, Helpline helplineDetails);
    void deleteHelpline(Long id);
    boolean existsByName(String name);
    boolean existsByNumber(String number);
}
