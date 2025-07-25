from api.heat_treatment.models import HeatTreatmentBatch
from django.core.exceptions import ObjectDoesNotExist

def get_heat_treatment_or_none(cast_code, heat_code):
    """
    Retrieves a HeatTreatmentBatch by cast_code and heat_code.
    Returns None if no match is found.
    """
    return HeatTreatmentBatch.objects.filter(
        cast_code=cast_code,
        heat_code=heat_code
    ).first()
