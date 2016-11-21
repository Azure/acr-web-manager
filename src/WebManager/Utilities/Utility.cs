using System;

namespace WebManager.Utilities
{
    public static class Utility
    {
        public static DateTime UnixToDateTime(long unixTime)
        {
            return DateTimeOffset.FromUnixTimeSeconds(unixTime).DateTime;
        }

        public static long DateTimeToUnix(DateTime time)
        {
            return new DateTimeOffset(time).ToUnixTimeSeconds();
        }

        public static byte[] FromUrlSafeBase64(string b64)
        {
            string convert = b64.Replace('_', '/').Replace('-', '+');

            if (convert.Length % 4 == 3)
            {
                convert += '=';
            }
            else if (convert.Length % 4 == 2)
            {
                convert += "==";
            }
            return Convert.FromBase64String(convert);
        }

        public static string ToUrlSafeBase64(byte[] bytes)
        {
            return Convert.ToBase64String(bytes).Replace('/', '_').Replace('+', '-').Replace("=", "");
        }
    }
}
