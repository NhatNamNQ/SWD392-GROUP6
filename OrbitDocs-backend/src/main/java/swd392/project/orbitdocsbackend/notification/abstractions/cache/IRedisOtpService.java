package swd392.project.orbitdocsbackend.notification.abstractions.cache;

public interface IRedisOtpService {

    boolean saveOtp(String type, String email, String otp);

    String getOtp(String email);

    void deleteOtp(String email);

    boolean validateOtp(String type, String email, String inputOtp);
}
