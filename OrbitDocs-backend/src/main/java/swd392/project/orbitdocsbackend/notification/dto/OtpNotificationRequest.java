package swd392.project.orbitdocsbackend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import swd392.project.orbitdocsbackend.notification.dto.Enums.OtpType;

@Getter
@Setter
@AllArgsConstructor
public class OtpNotificationRequest {
    private OtpRequest otpRequest;
    private String id;
    private OtpType otpType;
}
