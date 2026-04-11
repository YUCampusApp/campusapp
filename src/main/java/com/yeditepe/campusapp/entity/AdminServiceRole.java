package com.yeditepe.campusapp.entity;

/**
 * Hizmet alanına göre kampüs yöneticisi rolü ({@code admins.role}).
 * {@link UserRole#admin} ile karışmamalı: users.role = sistem rolü, burası modül yetkisi.
 */
public enum AdminServiceRole {
    Cafeteria,
    Library,
    Hairdresser,
    Market,
    Shuttle,
    Stationary
}
