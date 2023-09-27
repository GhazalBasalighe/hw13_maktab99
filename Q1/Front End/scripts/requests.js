const apiAddress = "http://localhost:3000/tasks";

//-----------------GET REQUESTS----------------
export async function getJSON(endpoint = "") {
  try {
    const url = `${apiAddress}/${endpoint}`;
    const request = await fetch(url);
    if (request.status !== 200) {
      window.location.href = "../htmlContent/NotFound.html";
    }
    const response = await request.json();
    return response;
  } catch {
    window.location.href = "../htmlContent/NotFound.html";
  }
}

//-----------------PATCH & PATCH REQUESTS----------------
export async function updateJSON(method, bodyObject, endpoint = "") {
  let redirectionNeeded = false;

  if (method === "PATCH" || method === "POST") {
    // PATCH & POST REQUESTS
    try {
      const request = await fetch(`${apiAddress}/${endpoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(bodyObject),
      });
      if (!request.ok) {
        redirectionNeeded = true;
      }

      await request.json();
    } catch {
      redirectionNeeded = true;
    }
  } else if (method === "DELETE") {
    // DELETE REQUESTS
    try {
      const response = await fetch(
        `http://localhost:3000/tasks/${bodyObject}`,
        {
          method: "DELETE",
        }
      );
      if (response.status !== 200) {
        redirectionNeeded = true;
      }
    } catch {
      redirectionNeeded = true;
    }
  }

  if (redirectionNeeded) {
    window.location.href = "../htmlContent/NotFound.html";
  }
}
