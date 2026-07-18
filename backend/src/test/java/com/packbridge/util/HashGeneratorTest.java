package com.packbridge.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class HashGeneratorTest {
    @Test
    public void generateHash_JoePassword() {
        String password = "Joe!10092011";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(password);
        System.out.println("GENERATED_BCRYPT_HASH=" + hash);
        assertTrue(encoder.matches(password, hash));
    }
}