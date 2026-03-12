package com.sagamelog.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SaMatchServiceImpl implements SaMatchService {

    @Value("${nexon.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpEntity<String> createAuthHeader() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-nxopen-api-key", apiKey);
        return new HttpEntity<>(headers);
    }

    @Override
    public Map<String, Object> getMatches(String ouid, String matchMode, String matchType) {
        try {
            StringBuilder urlBuilder = new StringBuilder("https://open.api.nexon.com/suddenattack/v1/match");
            urlBuilder.append("?ouid=").append(URLEncoder.encode(ouid, StandardCharsets.UTF_8));
            urlBuilder.append("&match_mode=").append(URLEncoder.encode(matchMode, StandardCharsets.UTF_8));

            if (matchType != null && !matchType.isBlank()) {
                urlBuilder.append("&match_type=").append(URLEncoder.encode(matchType, StandardCharsets.UTF_8));
            }

            URI uri = new URI(urlBuilder.toString());

            ResponseEntity<Map> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    createAuthHeader(),
                    Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("전적 조회 실패", e);
        }
    }

    @Override
    public Map<String, Object> getMatchDetail(String matchId) {
        try {
            URI uri = new URI(
                    "https://open.api.nexon.com/suddenattack/v1/match-detail?match_id="
                            + URLEncoder.encode(matchId, StandardCharsets.UTF_8)
            );

            ResponseEntity<Map> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    createAuthHeader(),
                    Map.class
            );

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("매치 상세 조회 실패", e);
        }
    }

    @Override
    public Map<String, Object> getRecentMatches(String ouid) {
        try {
            List<Map<String, Object>> mergedMatches = new ArrayList<>();

            String[] modes = { "폭파미션", "개인전", "데스매치", "진짜를 모아라" };

            for (String mode : modes) {
                Map<String, Object> modeResult = getMatches(ouid, mode, null);

                if (modeResult == null) {
                    continue;
                }

                Object matchObj = modeResult.get("match");
                if (matchObj instanceof List<?>) {
                    for (Object item : (List<?>) matchObj) {
                        if (item instanceof Map<?, ?> rawMap) {
                            Map<String, Object> matchMap = new HashMap<>();
                            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                                if (entry.getKey() != null) {
                                    matchMap.put(String.valueOf(entry.getKey()), entry.getValue());
                                }
                            }
                            mergedMatches.add(matchMap);
                        }
                    }
                }
            }

            mergedMatches.sort(new Comparator<Map<String, Object>>() {
                @Override
                public int compare(Map<String, Object> a, Map<String, Object> b) {
                    Instant dateA = parseDate(a.get("date_match"));
                    Instant dateB = parseDate(b.get("date_match"));
                    return dateB.compareTo(dateA);
                }
            });

            // 혹시 모드 병합 중 중복 match_id가 생길 경우 제거
            Map<String, Map<String, Object>> deduplicated = new LinkedHashMap<>();
            for (Map<String, Object> match : mergedMatches) {
                String matchId = String.valueOf(match.get("match_id"));
                deduplicated.putIfAbsent(matchId, match);
            }

            List<Map<String, Object>> finalMatches = new ArrayList<>(deduplicated.values());

            if (finalMatches.size() > 20) {
                finalMatches = finalMatches.subList(0, 20);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("match", finalMatches);
            return result;

        } catch (Exception e) {
            throw new RuntimeException("최근 전적 조회 실패", e);
        }
    }

    private Instant parseDate(Object value) {
        try {
            if (value == null) {
                return Instant.EPOCH;
            }
            return Instant.parse(String.valueOf(value));
        } catch (Exception e) {
            return Instant.EPOCH;
        }
    }
}