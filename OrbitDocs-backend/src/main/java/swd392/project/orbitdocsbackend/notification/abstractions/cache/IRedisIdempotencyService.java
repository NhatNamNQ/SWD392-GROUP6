package swd392.project.orbitdocsbackend.notification.abstractions.cache;

public interface IRedisIdempotencyService {

    boolean isProcessed(String eventId);

    void markProcessed(String eventId);
}
