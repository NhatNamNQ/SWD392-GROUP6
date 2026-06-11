package swd392.project.orbitdocsbackend.notification.abstractions;


import swd392.project.orbitdocsbackend.notification.dto.OtpNotificationRequest;

public interface INotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
}
