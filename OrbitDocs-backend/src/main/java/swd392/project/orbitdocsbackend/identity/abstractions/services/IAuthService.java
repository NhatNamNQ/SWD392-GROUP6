package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.dto.auth.request.*;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.AuthResponse;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.ConfirmOtpResult;
import swd392.project.orbitdocsbackend.identity.dto.auth.response.EmailActionResponse;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;

import javax.management.relation.RoleNotFoundException;

public interface IAuthService {
    void register(RegisterRequest request);
    EmailActionResponse forgetPassword(ForgetPasswordRequest request);
    EmailActionResponse reSendOtp(ResendOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    ConfirmOtpResult confirmOtp(ConfirmOtpRequest request) throws RoleNotFoundException;

    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String accessToken);
}
