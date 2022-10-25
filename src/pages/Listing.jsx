import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { toast } from "react-toastify";

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', params.listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log(docSnap.data());
          setListing(docSnap.data());
          setLoading(false);
        }
      } catch (error) {
        toast.error("Something get wrong!\nTry again later!");
        console.log(error);
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  const onShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 2000)
    console.log('clicked shared function');
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <main>
      {/* Slider */}


      <div className="shareIconDiv" onClick={onShareClick}>
        <img src={shareIcon} alt="shareIcon" />
      </div>

      {shareLinkCopied && <p className="linkCopied">Link Copied</p>}

      <div className="listingDetails">
        <p className="listingName">{listing.name} -
          ${listing.offer ? listing.discountedPrice
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : listing.regularPrice
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">For {listing.type}</p>

        {listing.offer &&
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        }

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1 ? `${ listing.bedrooms } Bedrooms` : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1 ? `${ listing.bathrooms } Bathrooms` : '1 Bathroom'}
          </li>
          {listing.parking &&
            <li>
              Parking
            </li>}
          {listing.furnished &&
            <li className="listingDetailsList">
              Furnished
            </li>}
        </ul>
        <p className="listingLocation">Location</p>

        {/* MAP */}

        {auth.currentUser?.uid !== listing.useRef && (
          <Link
            to={`/contact/${ listing.useRef }?listingName=${ listing.name }&listingLocation=${ listing.location }`}
            className='primaryButton'
          >
            Contact Landlord
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;
