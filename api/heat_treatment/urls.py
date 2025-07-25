from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import HTComponentViewSet, release_batch, list_batches, ReleasedHTComponentListView

# Register the HTComponent ViewSet
router = DefaultRouter()
router.register(r'ht-components', HTComponentViewSet, basename='ht-components')

# Combine router + custom function-based views
urlpatterns = router.urls + [
    path('release/', release_batch, name='release_batch'),
    path('list/', list_batches, name='list_batches'),
    path('eligible-components/', ReleasedHTComponentListView.as_view(), name='eligible-ht-components'),
]





# For HTComponent (via router)
# Method	URL	Description
# GET	/api/heat-treatment/ht-components/	List all components
# GET	/api/heat-treatment/ht-components/?batch=<id>	Filter by batch
# POST	/api/heat-treatment/ht-components/	Add component (auto-create batch)
# GET	/api/heat-treatment/ht-components/<id>/	Retrieve component
# PUT/PATCH	/api/heat-treatment/ht-components/<id>/	Update
# DELETE	/api/heat-treatment/ht-components/<id>/	Delete

# 🔹 For HeatTreatmentBatch (custom)
# Method	URL	Description
# POST	/api/heat-treatment/release/	Release a batch
# GET	/api/heat-treatment/list/	List batches