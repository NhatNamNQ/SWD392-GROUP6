package swd392.project.orbitdocsbackend.notification.abstractions.cache;

public interface IRedisRateLimitService {

    boolean isAllowed(String key);
}
