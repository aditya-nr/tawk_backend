import { env } from "../constant.js";
import { AccessTokenDto, JwtService, UserDto } from "../services/index.js";

export default (req, res, next) => {
    // 1) take user object
    const { user } = req;

    // 2) generate jwt
    const token = JwtService.sign(AccessTokenDto(user), env.ACCESS_TOKEN_TTL);

    // 3) prepare data for jwt
    const data = { token, ...UserDto(user) }

    res.json({ status: "OK", data });
}