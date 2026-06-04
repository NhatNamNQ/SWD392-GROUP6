package swd392.project.orbitdocsbackend.notification.abstractions.cache;

public interface IRedisOtpService {

    boolean saveOtp(String email, String otp);

    String getOtp(String email);

    void deleteOtp(String email);

    boolean validateOtp(String email, String inputOtp);
}
