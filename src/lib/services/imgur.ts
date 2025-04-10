import axios from 'axios';

class ImgurService {
  getClientId() {
    const clientId = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;
    if (!clientId) throw new Error("Missing Imgur client ID");
    return clientId;
  }

  async generateToken() {
    const form = new FormData();
    form.append('refresh_token', process.env.IMGUR_REFRESH_TOKEN);
    form.append('client_id', process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID);
    form.append('client_secret', process.env.IMGUR_CLIENT_SECRET);
    form.append('grant_type', 'refresh_token');
    const {data} = await axios.post('https://api.imgur.com/oauth2/token', form);
    return data;
  }

  async uploadImage(base64File: string) {
    const {data} = await axios.post("https://api.imgur.com/3/image", {
      image: base64File,
      type: "base64",
    }, {
      headers: {
        "Authorization": `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  }
}

export const imgurService = new ImgurService();
