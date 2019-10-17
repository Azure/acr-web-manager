using WebManager.Utility.Docker;
using WebManager.Utility.OCI;

namespace WebManager.Utility
{
    static class MediaTypeHelper
    {
        static string _acceptMediaTypes;

        public static string ManifestAcceptMediaTypes =>
            _acceptMediaTypes ??=
                    string.Join(',',
                        OCI.MediaTypes.IMAGE_INDEX,
                        OCI.MediaTypes.IMAGE_MANIFEST,
                        Docker.MediaTypes.IMAGE_INDEX,
                        Docker.MediaTypes.IMAGE_MANIFEST
                    );
    }
}