package com.yeditepe.campusapp.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("GENERAL")
public class LibraryGeneral extends LibrarySection {
}
