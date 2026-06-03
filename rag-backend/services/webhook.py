import requests
from core.config import settings
import logging

logger = logging.getLogger(__name__)

def sync_chapters_to_java(document_id: str, job_id: str, chapters_info: list[dict], chunk_count: int):
    """
    Sends the extracted chapters, chunk count, and job ID back to the Java backend.
    """
    url = f"{settings.java_backend_url}/api/internal/rag/chapters/sync"
    
    payload = {
        "documentId": document_id,
        "jobId": job_id,
        "chapters": chapters_info,
        "chunkCount": chunk_count
    }
    
    try:
        logger.info(f"Sending webhook to Java: {url}")
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        logger.info(f"Successfully synced chapters to Java. Response: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to sync chapters to Java: {e}")
        # Retries could be implemented here

def notify_failure_to_java(document_id: str, job_id: str, error_msg: str):
    """
    Notifies the Java backend that the indexing job has failed.
    """
    url = f"{settings.java_backend_url}/api/internal/rag/failed"
    
    payload = {
        "documentId": document_id,
        "jobId": job_id,
        "error": error_msg
    }
    
    try:
        logger.info(f"Sending failure webhook to Java: {url}")
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
        response.raise_for_status()
        logger.info(f"Successfully notified Java of failure. Response: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to notify Java of failure: {e}")
