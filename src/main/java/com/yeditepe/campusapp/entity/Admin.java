package com.yeditepe.campusapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Check;

@Entity
@Table(name = "admins")
@Check(constraints = "\"role\" in ('Cafeteria','Library','Hairdresser','Market','Shuttle','Stationary')")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    @Column(name = "admin_no", nullable = false, unique = true)
    private String adminNo;

    /**
     * {@code admins.role} — yalnızca {@link AdminServiceRole} değerleri; zorunlu.
     * Java alanı {@code serviceRole}: üst sınıftaki {@code User#role} ({@code users.role}) ile çakışmaması için.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private AdminServiceRole serviceRole;
}