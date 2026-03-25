package com.yeditepe.campusapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "admins")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @Column(nullable = false, unique = true)
    private String adminNo; // Yönetici sicil numarası

    // İleride buraya "yetkiSeviyesi" (örn: SUPER_ADMIN, EDITOR) gibi
    // sadece adminlere özel alanlar da ekleyebiliriz.
}