package com.sagamelog.service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
}