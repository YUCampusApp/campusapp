package com.yeditepe.campusapp.config;

import com.yeditepe.campusapp.entity.LibraryComp;
import com.yeditepe.campusapp.entity.LibraryGeneral;
import com.yeditepe.campusapp.repository.LibraryCompRepository;
import com.yeditepe.campusapp.repository.LibraryGeneralRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LibraryDataInitializer implements ApplicationRunner {

    @Value("${campusapp.library.comp-seats:30}")
    private int compSeats;

    @Value("${campusapp.library.general-seats:80}")
    private int generalSeats;

    private final LibraryCompRepository compRepository;
    private final LibraryGeneralRepository generalRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (compRepository.count() == 0) {
            LibraryComp c = new LibraryComp();
            c.setTotalSeats(compSeats);
            compRepository.save(c);
        }
        if (generalRepository.count() == 0) {
            LibraryGeneral g = new LibraryGeneral();
            g.setTotalSeats(generalSeats);
            generalRepository.save(g);
        }
    }
}
