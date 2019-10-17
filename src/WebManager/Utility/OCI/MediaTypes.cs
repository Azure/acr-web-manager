namespace WebManager.Utility.OCI
{
    public static class MediaTypes
    {
        public const string CONTENT_DESCRIPTOR = "application/vnd.oci.descriptor.v1+json"; // Content Descriptor
        public const string OCI_LAYOUT = "application/vnd.oci.layout.header.v1+json"; // OCI Layout
        public const string IMAGE_INDEX = "application/vnd.oci.image.index.v1+json"; // Image Index
        public const string IMAGE_MANIFEST = "application/vnd.oci.image.manifest.v1+json"; // Image manifest
        public const string IMAGE_CONFIG = "application/vnd.oci.image.config.v1+json"; // Image config
        public const string LAYER = "application/vnd.oci.image.layer.v1.tar"; // Layer as a tar archive
        public const string LAYER_GZIP = "application/vnd.oci.image.layer.v1.tar+gzip"; // Layer as a tar archive compressed with [gzip][rfc1952]
        public const string LAYER_ZSTD = "application/vnd.oci.image.layer.v1.tar+zstd"; // Layer as a tar archive compressed with [zstd][rfc8478]
        public const string LAYER_NON_DISTRIBUTABLE = "application/vnd.oci.image.layer.nondistributable.v1.tar"; // Layer as a tar archive with distribution restrictions
        public const string LAYER_NONDISTRIBUTABLE_GZIP = "application/vnd.oci.image.layer.nondistributable.v1.tar+gzip"; // Layer as a tar archive with distribution restrictions compressed with [gzip][rfc1952]
        public const string LAYER_NONDISTRIBUTABLE_ZSTD = "application/vnd.oci.image.layer.nondistributable.v1.tar+zstd"; // Layer" as a tar archive with distribution restrictions compressed with [zstd][rfc8478]
    }
}
