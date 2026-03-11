package com.sagamelog.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sagamelog.service.SaUserService;

@RestController
@RequestMapping("/api/sa")
public class SuddenAttackController {

    private final SaUserService saUserService;

    public SuddenAttackController(SaUserService saUserService) {
        this.saUserService = saUserService;
    }

    @GetMapping("/ouid")
    public ResponseEntity<Map<String, Object>> getOuid(@RequestParam String nickname) {
        Map<String, Object> result = new HashMap<>();

        try {
            String ouid = saUserService.getOuid(nickname);
            result.put("nickname", nickname);
            result.put("ouid", ouid);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", "OUID 조회 실패");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String nickname) {
        Map<String, Object> result = new HashMap<>();

        try {
            String ouid = saUserService.getOuid(nickname);

            result.put("nickname", nickname);
            result.put("ouid", ouid);
            result.put("basicInfo", saUserService.getBasicInfo(ouid));
            result.put("recentTrend", saUserService.getRecentTrend(ouid));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("error", "프로필 조회 실패");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
}