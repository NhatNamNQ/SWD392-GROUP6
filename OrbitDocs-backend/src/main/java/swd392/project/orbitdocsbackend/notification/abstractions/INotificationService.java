package swd392.project.orbitdocsbackend.notification.abstractions;


import swd392.project.orbitdocsbackend.notification.dtos.OtpNotificationRequest;

public interface INotificationService {
    void OtpNotificationHandler(OtpNotificationRequest request);
}
