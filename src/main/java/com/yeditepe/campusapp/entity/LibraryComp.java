package com.yeditepe.campusapp.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("COMP")
public class LibraryComp extends LibrarySection {
}
