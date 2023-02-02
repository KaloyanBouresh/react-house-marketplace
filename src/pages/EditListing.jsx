import { useState, useEffect, useRef } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useNavigate, useParams } from "react-router-dom"
import Spinner from "../components/Spinner"
import { toast } from "react-toastify"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";

function EditListing() {
    // eslint-disable-next-line no-unused-vars
    const [geolocationEnabled, setGeolocationEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [listing, setListing] = useState(null);
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        mileage: 0,
        transmission: "",
        hasInsurance: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,
    });

    const {
        type,
        name,
        mileage,
        transmission,
        hasInsurance,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude,
    } = formData;

    const auth = getAuth();
    const navigate = useNavigate();
    const params = useParams();
    const isMounted = useRef(true);

    // Redirect if listing is not user's
    useEffect(() => {
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error("You don't have permission to edit this listing");
            navigate('/');
        }
    })

    // Fetch listing to edit
    useEffect(() => {
        setLoading(true);
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing(docSnap.data());
                setFormData({
                    ...docSnap.data(),
                    address: docSnap.data().location
                })
                setLoading(false);
            }
            else {
                navigate('/');
                toast.error('Listing does not exist!');
            }
        }
        fetchListing();
    }, [params.listingId, navigate]);

    // Sets UserRef to logged on user
    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid });
                } else {
                    navigate("/sign-in");
                }
            });
        }
        return () => {
            isMounted.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (discountedPrice > +regularPrice) {
            setLoading(false);
            toast.error("Discounted price should be less than the regular price!");
            return;
        }

        if (images.length > 6) {
            setLoading(false);
            toast.error("Max 6 images!");
            return;
        }

        let geolocation = {};
        let location;

        if (geolocationEnabled) {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${ address }&key=${ process.env.REACT_APP_GEOCODE_API_KEY }`
            );

            const data = await response.json();

            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

            location =
                data.status === "ZERO_RESULTS"
                    ? "undefined"
                    : data.results[0]?.formatted_address;

            if (location === undefined || location.includes("undefined")) {
                setLoading(false);
                toast.error("Please enter a correct address!");
                return;
            }
        } else {
            geolocation.latitude = latitude;
            geolocation.longitude = longitude;
            location = address;
        }

        // Store images in firebase
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${ auth.currentUser.uid }-${ image.name }-${ uuidv4() }`;
                const storageRef = ref(storage, "images/" + fileName);
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log("Upload is " + progress + "% done");
                        // eslint-disable-next-line default-case
                        switch (snapshot.state) {
                            case "paused":
                                console.log("Upload is paused");
                                break;
                            case "running":
                                console.log("Upload is running");
                                break;
                        }
                    },
                    (error) => {
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            });
        };

        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false);
            toast.error("Images could not be uploaded :/");
            return;
        });

        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp(),
        };

        // Deleting unused objects if they are not needed for the current listing
        formDataCopy.location = address;
        delete formDataCopy.images;
        delete formDataCopy.address;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        // Update listing
        const docRef = doc(db, 'listings', params.listingId);
        await updateDoc(docRef, formDataCopy);

        setLoading(false);
        toast.success("Listing saved! :)");
        navigate(`/category/${ formDataCopy.type }/${ docRef.id }`);
    };

    const onMutate = (e) => {
        let boolean = null;

        if (e.target.value === "true") {
            boolean = true;
        }

        if (e.target.value === "false") {
            boolean = false;
        }

        // Files
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }));
        }
        // Text/Booleans/Numbers
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value,
            }));
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Edit Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className="formLabel">Sell / Rent</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={type === "sale" ? "formButtonActive" : "formButton"}
                            id="type"
                            value="sale"
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type="button"
                            className={type === "rent" ? "formButtonActive" : "formButton"}
                            id="type"
                            value="rent"
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>

                    <label className="formLabel">Name</label>
                    <input
                        type="text"
                        className="formInputName"
                        value={name}
                        id="name"
                        onChange={onMutate}
                        maxLength="40"
                        minLength="10"
                        required
                    />

                    <div className="formRooms flex">
                        <div>
                            <label className="formLabel">km</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                value={mileage}
                                id="mileage"
                                onChange={onMutate}
                                min="1"
                                max="1000000"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Transmission</label>
                            <input
                                type="text"
                                className="formInputSmall"
                                value={transmission}
                                id="transmission"
                                onChange={onMutate}
                                maxLength="20"
                                minLength="3"
                                required
                            />
                        </div>
                    </div>



                    <label className="formLabel">Insurance</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={hasInsurance ? "formButtonActive" : "formButton"}
                            id="hasInsurance"
                            value={true}
                            onClick={onMutate}
                            min="1"
                            max="50"
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className={
                                !hasInsurance && hasInsurance !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="furnished"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Adress</label>
                    <input
                        type="text"
                        className="formInputAddress"
                        value={address}
                        id="address"
                        onChange={onMutate}
                        required
                    />

                    {/* Show if geolocation is not enabled: */}
                    {!geolocationEnabled && (
                        <div className="formLatLng">
                            <div>
                                <label className="formLabel"> Latitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id="latitude"
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel"> Longitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id="longitude"
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={offer ? "formButtonActive" : "formButton"}
                            id="offer"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className={
                                !offer && offer !== null ? "formButtonActive" : "formButton"
                            }
                            id="offer"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            type="number"
                            className="formInputSmall"
                            id="regularPrice"
                            value={regularPrice}
                            onChange={onMutate}
                            min="50"
                            max="750000000"
                            required
                        />
                        {type === "rent" && <p className="formPriceText">$ / Day</p>}
                    </div>

                    {/* If offer is true */}
                    {offer && (
                        <>
                            <label className="formLabel">Discounted Price</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="discountedPrice"
                                value={discountedPrice}
                                onChange={onMutate}
                                min="50"
                                max="750000000"
                                required={offer}
                            />
                        </>
                    )}

                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        type="file"
                        className="formInputFile"
                        id="images"
                        onChange={onMutate}
                        max="6"
                        accept=".jpg, .png, .jpeg"
                        multiple
                        required
                    />
                    <button
                        type="submit"
                        className="primaryButton createListingButton"
                        onClick={onSubmit}
                    >
                        Update Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default EditListing;