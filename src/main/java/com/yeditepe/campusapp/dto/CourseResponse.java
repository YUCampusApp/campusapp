package com.yeditepe.campusapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class CourseResponse {
    private Long id;
    private String name;
    private List<CourseSectionResponse> sections;
}

