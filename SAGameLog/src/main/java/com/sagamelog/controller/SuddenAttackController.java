package com.sagamelog.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sagamelog.service.SaMatchService;
import com.sagamelog.service.SaUserService;

@RestController
@RequestMapping("/api/sa")
public class SuddenAttackController {

    private final SaUserService userService;
    private final SaMatchService matchService;

    public SuddenAttackController(SaUserService userService, SaMatchService matchService) {
        this.userService = userService;
        this.matchService = matchService;
    }

    @GetMapping("/profile")
    public Map<String, Object> getProfile(@RequestParam String nickname) throws Exception {
        String ouid = userService.getOuid(nickname);

        Map<String, Object> result = new HashMap<>();
        result.put("ouid", ouid);
        result.put("basicInfo", userService.getBasicInfo(ouid));
        result.put("recentTrend", userService.getRecentTrend(ouid));

        return result;
    }

    @GetMapping("/matches")
    public Map<String, Object> getMatches(
            @RequestParam String ouid,
            @RequestParam(name = "match_mode") String matchMode,
            @RequestParam(name = "match_type", required = false) String matchType) {

        return matchService.getMatches(ouid, matchMode, matchType);
    }

    @GetMapping("/recent-matches")
    public Map<String, Object> getRecentMatches(@RequestParam String ouid) {
        return matchService.getRecentMatches(ouid);
    }

    @GetMapping("/match-detail")
    public Map<String, Object> getMatchDetail(@RequestParam(name = "match_id") String matchId) {
        return matchService.getMatchDetail(matchId);
    }
}