from core.utils import upload_image_path


def blood_request_medical_report_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name="blood-requests/medical-reports",
        instance_field_name="id",
        name=f"blood-request-{getattr(instance, 'id', 'new')}-medical-report",
    )


def blood_request_prescription_image_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name="blood-requests/prescriptions",
        instance_field_name="id",
        name=f"blood-request-{getattr(instance, 'id', 'new')}-prescription",
    )


def blood_request_emergency_proof_upload_path(instance, filename):
    return upload_image_path(
        instance=instance,
        filename=filename,
        folder_name="blood-requests/emergency-proofs",
        instance_field_name="id",
        name=f"blood-request-{getattr(instance, 'id', 'new')}-emergency-proof",
    )
