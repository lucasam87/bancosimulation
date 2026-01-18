from firebase_functions import https_fn
from firebase_admin import initialize_app
from app.main import app as fastapi_app

initialize_app()

@https_fn.on_request(max_instances=10)
def api(req: https_fn.Request) -> https_fn.Response:
    with fastapi_app.request_context(req):
        return fastapi_app(req)
