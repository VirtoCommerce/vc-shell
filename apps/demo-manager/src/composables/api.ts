export class API {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async login(username: string, password: string): Promise<unknown> {
    try {
      const res = await fetch(`${this.apiUrl}/connect/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (res.status === 200) {
        return Promise.resolve(res.json());
      } else {
        return Promise.reject(res.text());
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
