package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class LectureNoteResponse {
    private Long id;
    private String courseName;
    private String title;
    private String uploadedByStudentNo;
    private Instant uploadedAt;
    private String fileName;
}

