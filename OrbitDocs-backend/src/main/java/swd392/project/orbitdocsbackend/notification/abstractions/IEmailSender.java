package swd392.project.orbitdocsbackend.notification.abstractions;

import java.util.concurrent.CompletableFuture;

public interface IEmailSender {

    //async functions
    CompletableFuture<Void> sendOtpEmailAsync(String toEmail, String otp);
    CompletableFuture<Void> sendPasswordResetEmailAsync(String toEmail, String resetLink);
    CompletableFuture<Void> sendLecturerCredentialsAsync(String toEmail, String randomPassword);

}
