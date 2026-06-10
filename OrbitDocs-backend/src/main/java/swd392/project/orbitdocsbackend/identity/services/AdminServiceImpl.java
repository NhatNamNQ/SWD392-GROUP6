package swd392.project.orbitdocsbackend.identity.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.RoleRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IAdminService;
import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateLecturerRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.identity.exception.user.UserExistException;
import swd392.project.orbitdocsbackend.identity.mapper.UserMapper;
import swd392.project.orbitdocsbackend.notification.abstractions.IEmailSender;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

import java.time.Instant;
import java.util.UUID;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final IEmailSender emailSender;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    @Override
    @Transactional
    public UserResponse createLecturer(CreateLecturerRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new UserExistException();
        }

        Role role = roleRepository.findByName(RoleName.LECTURER)
                .orElseThrow(() -> new RuntimeException("Role LECTURER not found"));

        String randomPassword = generateRandomPassword(8);

        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(passwordEncoder.encode(randomPassword));
        user.setActive(true);
        user.setPasswordChanged(false); // Force password change
        user.setRole(role);
        user.setCreatedAt(Instant.now());

        User savedUser = userRepository.save(user);

        // Send email asynchronously
        emailSender.sendLecturerCredentialsAsync(request.email(), randomPassword);

        return userMapper.toResponse(savedUser);
    }

    private String generateRandomPassword(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
