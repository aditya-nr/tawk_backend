import { env } from "../constant.js";
import { AccessTokenDto, JwtService } from "../services/index.js";

export default (req, res, next) => {
    // 1) take user object
    const { user } = req;

    // 2) prepare data for jwt
    const data = AccessTokenDto(user);
    // 3) generate jwt
    const token = JwtService.sign(data, env.ACCESS_TOKEN_TTL);

    res.json({ status: 200, token });
}