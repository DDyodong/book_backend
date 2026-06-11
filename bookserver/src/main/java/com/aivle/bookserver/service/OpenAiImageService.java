package com.aivle.bookserver.service;

import com.aivle.bookserver.dto.CoverGenerateRequest;
import com.aivle.bookserver.dto.CoverGenerateResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class OpenAiImageService {

    private static final URI IMAGE_GENERATION_URI = URI.create("https://api.openai.com/v1/images/generations");
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Value("${OPENAI_API_KEY:}")
    private String openAiApiKey;

    public CoverGenerateResponse generateCover(CoverGenerateRequest request) {
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "서버에 OpenAI API Key가 설정되어 있지 않습니다."
            );
        }

        try {
            String requestBody = OBJECT_MAPPER.writeValueAsString(Map.of(
                    "model", "gpt-image-2",
                    "prompt", request.prompt().trim(),
                    "n", 1,
                    "size", "1024x1536",
                    "quality", "medium",
                    "output_format", "png"
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder(IMAGE_GENERATION_URI)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openAiApiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(httpRequest, HttpResponse.BodyHandlers.ofString());

            JsonNode responseJson = OBJECT_MAPPER.readTree(response.body());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String message = responseJson.path("error").path("message").asText("표지 이미지 생성에 실패했습니다.");
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
            }

            String base64Image = responseJson.path("data").path(0).path("b64_json").asText();
            if (base64Image.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "생성된 이미지 데이터를 받지 못했습니다."
                );
            }

            return new CoverGenerateResponse("data:image/png;base64," + base64Image);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "OpenAI 응답을 처리하지 못했습니다.",
                    exception
            );
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "OpenAI 이미지 생성 요청이 중단되었습니다.",
                    exception
            );
        }
    }
}
