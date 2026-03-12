package com.sagamelog.service;

import java.util.Map;

public interface SaMatchService {
    Map<String, Object> getMatches(String ouid, String matchMode, String matchType);
    Map<String, Object> getMatchDetail(String matchId);
}