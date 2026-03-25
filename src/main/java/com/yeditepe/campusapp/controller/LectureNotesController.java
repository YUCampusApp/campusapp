package com.yeditepe.campusapp.controller;

import com.yeditepe.campusapp.dto.LectureNoteResponse;
import com.yeditepe.campusapp.service.MockLectureNotesService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/lecture-notes")
@RequiredArgsConstructor
public class LectureNotesController {

    private final MockLectureNotesService mockLectureNotesService;

    private String currentStudentNo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Not authenticated.");
        }
        return userDetails.getUsername();
    }

    @GetMapping
    public List<LectureNoteResponse> search(@RequestParam(name = "query", required = false) String query) {
        return mockLectureNotesService.search(query);
    }

    @PostMapping("/upload")
    public LectureNoteResponse upload(
            @RequestParam("courseName") String courseName,
            @RequestParam("title") String title,
            @RequestPart("file") MultipartFile file
    ) {
        return mockLectureNotesService.upload(currentStudentNo(), courseName, title, file);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable("id") Long id) {
        Path filePath = mockLectureNotesService.getFilePath(id);
        FileSystemResource resource = new FileSystemResource(filePath.toFile());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filePath.getFileName().toString()).build().toString())
                .body(resource);
    }
}

