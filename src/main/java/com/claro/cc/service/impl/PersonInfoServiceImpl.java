package com.claro.cc.service.impl;

import com.claro.cc.domain.Address;
import com.claro.cc.domain.Person;
import com.claro.cc.domain.PersonContact;
import com.claro.cc.repository.AddressRepository;
import com.claro.cc.repository.PersonContactRepository;
import com.claro.cc.repository.PersonRepository;
import com.claro.cc.repository.UserRepository;
import com.claro.cc.service.PersonInfoService;
import com.claro.cc.service.dto.PersonFullDTO;
import com.claro.cc.service.mapper.PersonFullMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class PersonInfoServiceImpl implements PersonInfoService {

    private final Logger log = LoggerFactory.getLogger(PersonInfoServiceImpl.class);

    @Autowired
    PersonRepository personRepository;

    @Autowired
    PersonFullMapper personFullMapper;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    PersonContactRepository personContactRepository;

    /*public PersonInfoServiceImpl(PersonRepository personRepository, PersonFullMapper personFullMapper) {
        this.personRepository = personRepository;
        this.personFullMapper = personFullMapper;
    }*/

    @Override
    public PersonFullDTO save(PersonFullDTO personFullDTO) {
        log.debug("Request to save Person : {}", personFullDTO);
        personFullDTO.setUserLogin(SecurityContextHolder.getContext().getAuthentication().getName());
        Person person = personFullMapper.personFullDTOToPerson(personFullDTO);
        person = personRepository.save(person);Set<Address> addresses = person.getAddresses();
        System.out.println(addresses);
        for(Address a: addresses){
            System.out.println(a);
            a.setPerson(person);
            addressRepository.save(a);
        }
        for(PersonContact pc : person.getPersonContacts()){
            System.out.println(pc);
            pc.setPerson(person);
            personContactRepository.save(pc);
        }
        return personFullMapper.personToPersonFullDTO(person);
        //return personFullDTO;
    }
}
