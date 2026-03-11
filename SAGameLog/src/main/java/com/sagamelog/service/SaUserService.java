package com.sagamelog.service;

import java.util.Map;

public interface SaUserService {
    String getOuid(String nickname) throws Exception;
    Map<String, Object> getBasicInfo(String ouid);
    Map<String, Object> getRecentTrend(String ouid);
}