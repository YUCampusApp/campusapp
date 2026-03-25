package com.yeditepe.campusapp.auth;

import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CaptchaStore {

    private static final long TTL_MS = 10 * 60 * 1000L;

    private record CaptchaEntry(String code, long createdAt) {}

    private final ConcurrentHashMap<String, CaptchaEntry> entries = new ConcurrentHashMap<>();

    public void store(String id, String code) {
        purgeExpired();
        entries.put(id, new CaptchaEntry(code, System.currentTimeMillis()));
    }

    public boolean consume(String id, String code) {
        CaptchaEntry e = entries.remove(id);
        if (e == null) {
            return false;
        }
        if (System.currentTimeMillis() - e.createdAt > TTL_MS) {
            return false;
        }
        return Objects.equals(e.code, code);
    }

    private void purgeExpired() {
        long now = System.currentTimeMillis();
        entries.entrySet().removeIf(en -> now - en.getValue().createdAt > TTL_MS);
    }
}
