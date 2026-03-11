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

import com.sagamelog.dto.OuidDto;

@Service
public class SaUserServiceImpl implements SaUserService {

    @Value("${nexon.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpEntity<String> createAuthHeader() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-nxopen-api-key", apiKey);
        return new HttpEntity<>(headers);
    }

    @Override
    public String getOuid(String nickname) throws Exception {
        String encodedName = URLEncoder.encode(nickname, StandardCharsets.UTF_8);
        URI uri = new URI("https://open.api.nexon.com/suddenattack/v1/id?user_name=" + encodedName);

        ResponseEntity<OuidDto> response = restTemplate.exchange(
                uri,
                HttpMethod.GET,
                createAuthHeader(),
                OuidDto.class
        );

        if (response.getBody() == null || response.getBody().getOuid() == null) {
            throw new RuntimeException("OUID를 찾을 수 없습니다.");
        }

        return response.getBody().getOuid();
    }

    @Override
    public Map<String, Object> getBasicInfo(String ouid) {
        String url = "https://open.api.nexon.com/suddenattack/v1/user/basic?ouid=" + ouid;

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                createAuthHeader(),
                Map.class
        );

        return response.getBody();
    }

    @Override
    public Map<String, Object> getRecentTrend(String ouid) {
        String url = "https://open.api.nexon.com/suddenattack/v1/user/recent-info?ouid=" + ouid;

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                createAuthHeader(),
                Map.class
        );

        return response.getBody();
    }
}