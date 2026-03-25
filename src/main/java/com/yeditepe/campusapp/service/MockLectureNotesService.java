package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.LectureNoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MockLectureNotesService {

    private record NoteModel(Long id, String courseName, String title, String uploadedByStudentNo, Instant uploadedAt, String fileName, Path filePath) {}

    private final AtomicLong idSeq = new AtomicLong(1);
    private final Map<Long, NoteModel> notesById = new ConcurrentHashMap<>();

    private Path uploadDir;

    @PostConstruct
    public void init() {
        uploadDir = Path.of("uploads", "lecture-notes");
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create uploads directory: " + uploadDir, e);
        }
    }

    public LectureNoteResponse upload(String studentNo, String courseName, String title, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required.");
        }
        if (courseName == null || courseName.isBlank()) {
            throw new IllegalArgumentException("courseName is required.");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required.");
        }

        long id = idSeq.getAndIncrement();
        String safeFileName = file.getOriginalFilename() == null ? "note" : file.getOriginalFilename();
        String storedName = id + "-" + safeFileName;
        Path dest = uploadDir.resolve(storedName);

        try {
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file.", e);
        }

        NoteModel model = new NoteModel(id, courseName, title, studentNo, Instant.now(), safeFileName, dest);
        notesById.put(id, model);

        LectureNoteResponse res = new LectureNoteResponse();
        res.setId(model.id());
        res.setCourseName(model.courseName());
        res.setTitle(model.title());
        res.setUploadedByStudentNo(model.uploadedByStudentNo());
        res.setUploadedAt(model.uploadedAt());
        res.setFileName(model.fileName());
        return res;
    }

    public List<LectureNoteResponse> search(String query) {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);

        return notesById.values().stream()
                .filter(n -> q.isEmpty()
                        || n.courseName().toLowerCase(Locale.ROOT).contains(q)
                        || n.title().toLowerCase(Locale.ROOT).contains(q))
                .sorted(Comparator.comparing(NoteModel::uploadedAt).reversed())
                .map(n -> {
                    LectureNoteResponse res = new LectureNoteResponse();
                    res.setId(n.id());
                    res.setCourseName(n.courseName());
                    res.setTitle(n.title());
                    res.setUploadedByStudentNo(n.uploadedByStudentNo());
                    res.setUploadedAt(n.uploadedAt());
                    res.setFileName(n.fileName());
                    return res;
                })
                .toList();
    }

    public Path getFilePath(long id) {
        NoteModel model = notesById.get(id);
        if (model == null) {
            throw new IllegalArgumentException("Note not found: " + id);
        }
        return model.filePath();
    }
}

